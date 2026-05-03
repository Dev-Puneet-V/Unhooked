import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const guidelineWidth = 390;
const guidelineHeight = 844;

const round = (size: number) => Math.round(size);

export const scale = (size: number) => round((width / guidelineWidth) * size);

export const verticalScale = (size: number) =>
  round((height / guidelineHeight) * size);
