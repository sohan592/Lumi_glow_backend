import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFaceAnalysisDto } from './dto/create-face-analysis.dto';
import { UpdateFaceAnalysisDto } from './dto/update-face-analysis.dto';
import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { extractTagsFromAnalysis } from '@utils/utils';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  In,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { FaceAnalysisLog } from './entities/face-analysis.entity';
import { ProductEntity } from '../products/entity/product.entity';

@Injectable()
export class FaceAnalysisService {
  private readonly apiUrl =
    'https://api-us.faceplusplus.com/facepp/v1/skinanalyze';
  private readonly apiKey = process.env.FACE_API_KEY;
  private readonly apiSecret = process.env.FACE_API_SECRET;

  constructor(
    @InjectRepository(FaceAnalysisLog)
    private readonly faceAnalysisLogRepository: Repository<FaceAnalysisLog>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  // Save log entry after analysis
  private async saveAnalysisLog(
    userId: number,
    imageUrl: string,
    preferredTags: string[],
    analysisResults: any,
    errorMessage?: string,
  ): Promise<FaceAnalysisLog> {
    const log = new FaceAnalysisLog();
    log.userId = userId;
    log.imageUrl = imageUrl;
    log.preferredTags = preferredTags;
    log.analysisResults = analysisResults;
    log.errorMessage = errorMessage || null;

    return this.faceAnalysisLogRepository.save(log);
  }

  // Analyze skin from file (now with logging)
  async analyzeSkinFromFile(userId: number, filePath: string): Promise<any> {
    //check has trial limit
    const scanCount = await this.getUserScanCountForCurrentMonth(userId);
    if (scanCount >= 2) {
      throw new HttpException(
        'You have reached the maximum number of scans for this month.',
        HttpStatus.FORBIDDEN,
      );
    }
    if (!fs.existsSync(filePath)) {
      throw new HttpException('Image file not found.', HttpStatus.BAD_REQUEST);
    }

    const maxFileSize = 2 * 1024 * 1024; // 2MB
    const maxDimension = 4096;

    let imageBuffer = fs.readFileSync(filePath);
    const metadata = await sharp(imageBuffer).metadata();

    // Check if the image is not a JPG/JPEG and convert it if necessary
    let isJpeg = metadata.format === 'jpeg';
    if (!isJpeg) {
      // Convert to JPEG if it's not in JPG/JPEG format
      imageBuffer = await sharp(imageBuffer)
        .toFormat('jpeg', { quality: 80 }) // Convert to JPEG with 80% quality
        .toBuffer();
    }

    // Resize and compress if needed
    if (
      imageBuffer.length > maxFileSize ||
      metadata.width > maxDimension ||
      metadata.height > maxDimension
    ) {
      const resizedBuffer = await sharp(imageBuffer)
        .resize({
          width: Math.min(metadata.width, maxDimension),
          height: Math.min(metadata.height, maxDimension),
          fit: 'inside',
        })
        .jpeg({ quality: 80 }) // Adjust quality to keep under 2MB
        .toBuffer();

      imageBuffer = resizedBuffer;
    }

    // Create a temporary file to send via stream
    const tempPath = path.join(
      path.dirname(filePath),
      `temp-${path.basename(filePath)}`,
    );
    fs.writeFileSync(tempPath, imageBuffer);

    const form = new FormData();
    form.append('api_key', this.apiKey);
    form.append('api_secret', this.apiSecret);
    form.append('image_file', fs.createReadStream(tempPath));

    try {
      const response = await axios.post(this.apiUrl, form, {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      const applicableTags = extractTagsFromAnalysis(response.data?.result);
      // Assuming the image URL is returned in the response
      const imageUrl = response.data?.image_url || 'temporary-image-url';

      // Save log entry with user info
      await this.saveAnalysisLog(
        userId,
        imageUrl,
        applicableTags,
        response.data,
      );

      return { ...response.data, applicableTags };
    } catch (error) {
      if (error.response?.data) {
        throw new HttpException(
          error.response.data.error_message || 'Skin analysis failed.',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath); // Clean up temp file
      }
    }
  }

  // Analyze skin from URL (now with logging)
  async analyzeSkinFromUrl(userId: number, imageUrl: string): Promise<any> {
    //check has trial limit
    const scanCount = await this.getUserScanCountForCurrentMonth(userId);
    if (scanCount >= 2) {
      throw new HttpException(
        'You have reached the maximum number of scans for this month.',
        HttpStatus.FORBIDDEN,
      );
    }
    const form = new FormData();
    form.append('api_key', this.apiKey);
    form.append('api_secret', this.apiSecret);
    form.append('image_url', imageUrl);

    try {
      const response = await axios.post(this.apiUrl, form, {
        headers: form.getHeaders(),
      });

      const applicableTags = extractTagsFromAnalysis(response.data?.result);
      // Save log entry with user info
      await this.saveAnalysisLog(
        userId,
        imageUrl,
        applicableTags,
        response.data,
      );

      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new HttpException(
          error.response.data.error_message || 'Skin analysis failed.',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get recent face analysis records with simplified output
   * @param userId The ID of the user to get records for
   * @returns Array of simplified analysis results with dates and tags + confidence
   */
  async getUserRecentAnalyses(userId: number): Promise<any[]> {
    const recentAnalyses = await this.faceAnalysisLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 7,
    });

    return recentAnalyses.map((analysis: any) => {
      const result: any = analysis.analysisResults?.result || {};
      const tagsWithConfidence: Record<string, number> = {};

      // Binary features - only include if value is "1" or 1
      const conditionMap = {
        eye_pouch: 'eye_pouch',
        dark_circle: 'dark_circle',
        forehead_wrinkle: 'forehead_wrinkle',
        crows_feet: 'crows_feet',
        eye_finelines: 'eye_finelines',
        glabella_wrinkle: 'glabella_wrinkle',
        nasolabial_fold: 'nasolabial_fold',
        pores_forehead: 'large_pores_forehead',
        pores_left_cheek: 'large_pores_left_cheek',
        pores_right_cheek: 'large_pores_right_cheek',
        pores_jaw: 'large_pores_jaw',
        blackhead: 'blackhead',
      };

      for (const [key, tag] of Object.entries(conditionMap)) {
        if (
          (result[key]?.value === '1' || result[key]?.value === 1) &&
          result[key]?.confidence !== undefined
        ) {
          tagsWithConfidence[tag] = result[key].confidence;
        }
      }

      // Numeric tags - only include if value > 0
      const numericTags = ['acne', 'mole', 'skin_spot'];
      for (const tag of numericTags) {
        if (result[tag]?.value > 0 && result[tag]?.confidence !== undefined) {
          tagsWithConfidence[tag] = result[tag].confidence;
        }
      }

      // Eyelid types - always include as they're a trait, not a condition
      const eyelidTypes = {
        '0': 'single_fold_eyelid',
        '1': 'parallel_double_fold_eyelid',
        '2': 'fanshaped_double_fold_eyelid',
      };

      if (
        result.left_eyelids?.value &&
        result.left_eyelids?.confidence !== undefined
      ) {
        const tag = `left_${eyelidTypes[result.left_eyelids.value] || 'unknown'}`;
        tagsWithConfidence[tag] = result.left_eyelids.confidence;
      }

      if (
        result.right_eyelids?.value &&
        result.right_eyelids?.confidence !== undefined
      ) {
        const tag = `right_${eyelidTypes[result.right_eyelids.value] || 'unknown'}`;
        tagsWithConfidence[tag] = result.right_eyelids.confidence;
      }

      // Skin type - always include as everyone has a skin type
      if (
        result.skin_type?.skin_type !== undefined &&
        result.skin_type?.confidence !== undefined
      ) {
        const skinTypes = [
          'oily_skin',
          'dry_skin',
          'normal_skin',
          'combination_skin',
        ];
        const skinType = skinTypes[result.skin_type.skin_type];
        if (skinType) {
          tagsWithConfidence[skinType] = result.skin_type.confidence;
        }
      }

      return {
        id: analysis.id,
        createdAt: analysis.createdAt,
        tags: tagsWithConfidence,
        availableTags: Object.keys(tagsWithConfidence),
      };
    });
  }

  /**
   * Suggests products to a user based on their most recent face analysis scan
   * @param userId The ID of the user to suggest products for
   * @returns Array of product recommendations (always 20)
   */
  async suggestProductsFromLastScan(userId: number): Promise<ProductEntity[]> {
    try {
      // Retrieve the user's recent analyses
      const recentAnalyses = await this.getUserRecentAnalyses(userId);
      console.log(
        `Found ${recentAnalyses.length} recent analyses for user ${userId}`,
      );

      // If no recent analyses, return 20 random products
      if (!recentAnalyses.length) {
        console.log('No recent analyses, returning random products');
        return this.getRandomProducts(20);
      }

      // Extract tags from the most recent analysis
      const lastAnalysis = recentAnalyses[0];
      const matchedTagSlugs = lastAnalysis.availableTags || [];
      console.log('Tag slugs from analysis:', matchedTagSlugs);

      // If no tags found, return 20 random products
      if (!matchedTagSlugs.length) {
        console.log('No tags found, returning random products');
        return this.getRandomProducts(20);
      }

      // Fetch products with matched tag slugs (not names)
      const matchedProducts = await this.productRepository.find({
        where: {
          status: { name: 'ACTIVE' },
          totalStock: MoreThan(0),
          tags: {
            slug: In(matchedTagSlugs), // Match by slug instead of name
          },
        },
        relations: ['tags', 'status', 'featureImage', 'category'],
        order: this.getRandomOrderingOption(),
        select: {
          id: true,
          name: true,
          price: true,
          slug: true,
          featureImage: {
            id: true,
            path: true,
          },
          category: {
            id: true,
            name: true,
            slug: true,
          },
          tags: {
            id: true,
            name: true,
            slug: true,
          },
        },
      });
      console.log(`Found ${matchedProducts.length} products matching the tags`);

      // Get unique products (in case a product matches multiple tags)
      const uniqueMatchedProducts = this.getUniqueProducts(matchedProducts);
      console.log(
        `After removing duplicates: ${uniqueMatchedProducts.length} products`,
      );

      // Take up to 20 products
      const selectedMatchedProducts = uniqueMatchedProducts.slice(0, 20);

      // If we have 20 or more products, return them
      if (selectedMatchedProducts.length >= 20) {
        console.log('Returning 20 matched products');
        return selectedMatchedProducts.slice(0, 20); // Ensure exactly 20
      }

      // Calculate how many more products we need
      const remainingCount = 20 - selectedMatchedProducts.length;
      console.log(`Need ${remainingCount} more products to reach 20`);

      // Get IDs to exclude
      const excludeIds = selectedMatchedProducts.map((product) => product.id);

      // Special handling for empty excludeIds
      let additionalProductsQuery;
      if (excludeIds.length === 0) {
        // No products to exclude
        additionalProductsQuery = {
          where: {
            status: { name: 'ACTIVE' },
            totalStock: MoreThan(0),
          },
          select: {
            id: true,
            name: true,
            price: true,
            slug: true,
            featureImage: {
              id: true,
              path: true,
            },
            category: {
              id: true,
              name: true,
              slug: true,
            },
            tags: {
              id: true,
              name: true,
              slug: true,
            },
          },
          relations: ['tags', 'status', 'featureImage', 'category'],
          order: this.getRandomOrderingOption(),
          take: remainingCount,
        };
      } else {
        // Exclude already matched products
        additionalProductsQuery = {
          where: {
            status: { name: 'ACTIVE' },
            totalStock: MoreThan(0),
            id: Not(In(excludeIds)),
          },
          select: {
            id: true,
            name: true,
            price: true,
            slug: true,
            featureImage: {
              id: true,
              path: true,
            },
            category: {
              id: true,
              name: true,
              slug: true,
            },
            tags: {
              id: true,
              name: true,
              slug: true,
            },
          },
          relations: ['tags', 'status', 'featureImage', 'category'],
          order: this.getRandomOrderingOption(),
          take: remainingCount,
        };
      }

      // Fetch additional random products
      const additionalProducts = await this.productRepository.find(
        additionalProductsQuery,
      );
      console.log(`Found ${additionalProducts.length} additional products`);

      // Combine matched and additional products
      const result = [...selectedMatchedProducts, ...additionalProducts];
      console.log(`Returning total of ${result.length} products`);

      // Final safety check to ensure no duplicates
      const finalResult = this.getUniqueProducts(result);
      if (finalResult.length !== result.length) {
        console.warn(
          `Removed ${result.length - finalResult.length} unexpected duplicates`,
        );
      }

      return finalResult;
    } catch (error) {
      console.error('Error suggesting products:', error);
      // Always return something, even on error
      return this.getFallbackProducts();
    }
  }

  /**
   * Get random products using repository methods
   * @param count Number of products to return
   * @returns Array of random products
   */
  private async getRandomProducts(count: number): Promise<ProductEntity[]> {
    return this.productRepository.find({
      where: {
        status: { name: 'ACTIVE' },
        totalStock: MoreThan(0),
      },
      select: {
        id: true,
        name: true,
        price: true,
        slug: true,
        featureImage: {
          id: true,
          path: true,
        },
        category: {
          id: true,
          name: true,
          slug: true,
        },
        tags: {
          id: true,
          name: true,
          slug: true,
        },
      },
      relations: ['tags', 'status', 'featureImage', 'category'],
      order: this.getRandomOrderingOption(),
      take: count,
    });
  }

  /**
   * Get a random ordering option for TypeORM queries
   * @returns A random ordering option
   */
  private getRandomOrderingOption(): any {
    // Array of possible fields to sort by
    const orderFields = ['id', 'name', 'createdAt', 'updatedAt', 'price'];

    // Array of possible directions
    const orderDirections = ['ASC', 'DESC'];

    // Randomly pick a field and direction
    const randomField =
      orderFields[Math.floor(Math.random() * orderFields.length)];
    const randomDirection =
      orderDirections[Math.floor(Math.random() * orderDirections.length)];

    // Return the ordering object
    return { [randomField]: randomDirection };
  }

  /**
   * Remove duplicate products from an array
   * @param products Array of products that may contain duplicates
   * @returns Array of unique products
   */
  private getUniqueProducts(products: ProductEntity[]): ProductEntity[] {
    const uniqueMap = new Map<number, ProductEntity>();

    for (const product of products) {
      if (!uniqueMap.has(product.id)) {
        uniqueMap.set(product.id, product);
      }
    }

    return Array.from(uniqueMap.values());
  }

  /**
   * Get fallback products if something fails
   * Simple query with minimal conditions to ensure we get results
   */
  private async getFallbackProducts(): Promise<ProductEntity[]> {
    try {
      return this.productRepository.find({
        where: {
          totalStock: MoreThan(0),
        },
        select: {
          id: true,
          name: true,
          price: true,
          slug: true,
          featureImage: {
            id: true,
            path: true,
          },
          category: {
            id: true,
            name: true,
            slug: true,
          },
          tags: {
            id: true,
            name: true,
            slug: true,
          },
        },
        relations: ['tags', 'status', 'featureImage', 'category'],
        take: 20,
      });
    } catch (error) {
      console.error('Even fallback query failed:', error);
      return []; // Return empty array as last resort
    }
  }

  /**
   * Count the total number of face analysis scans a user has performed in the current month
   * @param userId The ID of the user to count scans for
   * @returns Number of scans in the current month
   */
  async getUserScanCountForCurrentMonth(userId: number): Promise<number> {
    // Calculate the first and last day of the current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    try {
      // Query to count scans in date range
      const scanCount = await this.faceAnalysisLogRepository.count({
        where: {
          userId: userId,
          createdAt: Between(firstDayOfMonth, lastDayOfMonth),
        },
      });

      return scanCount;
    } catch (error) {
      console.error(`Error counting scans for user ${userId}:`, error);
      throw new HttpException(
        'Failed to retrieve scan count',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
