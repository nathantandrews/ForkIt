import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';

import { useAuth, useUserProfile } from '../firebase/hooks';

// Placeholder Screens (will replace with real imports)
import ProfileSetup from '../screens/ProfileSetup';
import Home from '../screens/Home';
import CreateSession from '../screens/CreateSession';
import JoinSession from '../screens/JoinSession';
import SessionLobby from '../screens/SessionLobby';
import Recommendations from '../screens/Recommendations';
import RestaurantDetail from '../screens/RestaurantDetail';
import FinalResult from '../screens/FinalResult';

// Temporary placeholders to build navigation structure
// const PlaceholderScreen = ({ name }: { name: string }) => (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator />
//     </View>
// );

export type RootStackParamList = {
    ProfileSetup: undefined;
    Home: undefined;
    CreateSession: undefined;
    JoinSession: undefined;
    SessionLobby: { sessionId: string };
    Recommendations: { sessionId: string };
    RestaurantDetail: { restaurantId: string; sessionId: string };
    FinalResult: { sessionId: string };
};

// Auth Stack
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';

const AuthStack = createStackNavigator();
const AppStack = createStackNavigator<RootStackParamList>();

function AuthNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="SignUp" component={SignUpScreen} />
        </AuthStack.Navigator>
    );
}

function AppNavigatorContent() {
    return (
        <AppStack.Navigator initialRouteName="Home">
            <AppStack.Screen name="Home" component={Home} options={{ title: 'Create Session' }} />
            <AppStack.Screen name="ProfileSetup" component={ProfileSetup} options={{ title: 'Profile Setup' }} />
            <AppStack.Screen name="CreateSession" component={CreateSession} options={{ title: 'Create Session' }} />
            <AppStack.Screen name="JoinSession" component={JoinSession} options={{ title: 'Join Session' }} />
            <AppStack.Screen name="SessionLobby" component={SessionLobby} options={{ title: 'Session Lobby' }} />
            <AppStack.Screen name="Recommendations" component={Recommendations} options={{ title: 'Recommendations' }} />
            <AppStack.Screen name="RestaurantDetail" component={RestaurantDetail} options={{ title: 'Restaurant Details' }} />
            <AppStack.Screen name="FinalResult" component={FinalResult} options={{ title: 'Final Result', headerLeft: () => null }} />
        </AppStack.Navigator>
    );
}

export default function AppNavigator() {
    const { user, loading: authLoading } = useAuth();

    if (authLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? <AppNavigatorContent /> : <AuthNavigator />}
        </NavigationContainer>
    );
}

// Temporary components to satisfy TS until we create files
import { Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PlaceholderHome = () => {
    const navigation = useNavigation<any>();
    const { profile } = useUserProfile(useAuth().user?.uid);

    // Auto-redirect to ProfileSetup if new user
    // Note: This might cause flicker, better to do in a wrapper, but OK for prototype
    React.useEffect(() => {
        if (profile === null) { // loaded and explicitly null
            // navigation.replace('ProfileSetup'); // commented out until implemented
        }
    }, [profile]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>ForkIt Home</Text>
            <Button title="Edit Profile" onPress={() => navigation.navigate('ProfileSetup')} />
            <Button title="Create Session" onPress={() => navigation.navigate('CreateSession')} />
            <Button title="Join Session" onPress={() => navigation.navigate('JoinSession')} />
        </View>
    );
}

const PlaceholderProfile = () => <View><Text>Profile Setup</Text></View>;
const PlaceholderCreate = () => <View><Text>Create Session</Text></View>;
const PlaceholderJoin = () => <View><Text>Join Session</Text></View>;
const PlaceholderLobby = () => <View><Text>Session Lobby</Text></View>;
const PlaceholderRecs = () => <View><Text>Recommendations</Text></View>;
const PlaceholderDetail = () => <View><Text>Detail</Text></View>;
const PlaceholderResult = () => <View><Text>Result</Text></View>;
