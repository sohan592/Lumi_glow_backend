import slugify from 'slugify';

type FaceAnalysisResult = {
  left_eyelids: { value: string };
  right_eyelids: { value: string };
  eye_pouch: { value: string };
  dark_circle: { value: string };
  forehead_wrinkle: { value: string };
  crows_feet: { value: string };
  eye_finelines: { value: string };
  glabella_wrinkle: { value: string };
  nasolabial_fold: { value: string };
  skin_type: { skin_type: number };
  pores_forehead: { value: string };
  pores_left_cheek: { value: string };
  pores_right_cheek: { value: string };
  pores_jaw: { value: string };
  blackhead: { value: string };
  acne: { value: number };
  mole: { value: number };
  skin_spot: { value: number };
};

export const createSlug = (text: string): string => {
  const randomString = Math.random().toString(36).substring(2, 8);
  return (
    slugify(text, {
      lower: true,
      strict: true,
      trim: true,
    }) +
    '-' +
    randomString
  );
};

export function extractTagsFromAnalysis(result: FaceAnalysisResult): string[] {
  const tags: string[] = [];

  const conditionMap: Record<string, string> = {
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
    acne: 'acne',
    mole: 'mole',
    skin_spot: 'skin_spot',
  };

  // Check binary values (0 = no issue, 1 = issue exists)
  for (const [key, tag] of Object.entries(conditionMap)) {
    const value = (result as any)[key]?.value;
    if (value === '1' || value === 1) {
      tags.push(tag);
    }
  }

  // Handle eyelid types
  const eyelidTypes = {
    '0': 'single_fold_eyelid',
    '1': 'parallel_double_fold_eyelid',
    '2': 'fanshaped_double_fold_eyelid',
  };

  // Add left eyelid type
  const leftEyelidValue = result.left_eyelids?.value;
  if (leftEyelidValue && eyelidTypes[leftEyelidValue]) {
    tags.push(`left_${eyelidTypes[leftEyelidValue]}`);
  }

  // Add right eyelid type
  const rightEyelidValue = result.right_eyelids?.value;
  if (rightEyelidValue && eyelidTypes[rightEyelidValue]) {
    tags.push(`right_${eyelidTypes[rightEyelidValue]}`);
  }

  // Handle skin type
  switch (result.skin_type.skin_type) {
    case 0:
      tags.push('oily_skin');
      break;
    case 1:
      tags.push('dry_skin');
      break;
    case 2:
      tags.push('normal_skin');
      break;
    case 3:
      tags.push('combination_skin');
      break;
  }

  return tags;
}
