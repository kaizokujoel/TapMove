// Type declaration for react-native-qrcode-styled
declare module 'react-native-qrcode-styled' {
  import { ComponentType } from 'react';
  import { ViewStyle, StyleProp } from 'react-native';

  interface QRCodeStyledProps {
    data: string;
    style?: StyleProp<ViewStyle>;
    pieceSize?: number;
    color?: string;
    pieceCornerType?: 'square' | 'rounded';
    pieceBorderRadius?: number;
    isPiecesGlued?: boolean;
    padding?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    outerEyesOptions?: {
      topLeft?: { borderRadius?: number; color?: string };
      topRight?: { borderRadius?: number; color?: string };
      bottomLeft?: { borderRadius?: number; color?: string };
    };
    innerEyesOptions?: {
      topLeft?: { borderRadius?: number; color?: string };
      topRight?: { borderRadius?: number; color?: string };
      bottomLeft?: { borderRadius?: number; color?: string };
    };
    logo?: {
      href: string;
      padding?: number;
      scale?: number;
    };
  }

  const QRCodeStyled: ComponentType<QRCodeStyledProps>;
  export default QRCodeStyled;
}
