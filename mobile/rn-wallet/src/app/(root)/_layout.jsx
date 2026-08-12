import { useUser } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { Stack } from 'expo-router/stack';


export default function Layout() {
    const { isSignedIn,isLoaded } = useUser();
    

    if (!isLoaded) {
        return null; // or a loading indicator
    }
    if (!isSignedIn) {
        return <Redirect href="/(auth)/sign-in" />;
    }

    return  <Stack screenOptions={{headerShown: false}} />;
            
}