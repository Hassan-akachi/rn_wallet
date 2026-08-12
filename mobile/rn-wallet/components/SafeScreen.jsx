import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 👈 Added missing import
import { COLORS } from '../constants/colors';

const SafeScreen = ({children}) => {
    // 👈 Fixed typo: changed to 'insets' to match standard naming
    const insets = useSafeAreaInsets(); 
    
  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: COLORS.background }}>
      {children}
    </View>
  );
}

export default SafeScreen;