import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';

import { useAuth, useUserProfile } from '../firebase/hooks';

import ProfileSetup from '../screens/ProfileSetup';
import Home from '../screens/Home';
import CreateSession from '../screens/CreateSession';
import JoinSession from '../screens/JoinSession';
import SessionLobby from '../screens/SessionLobby';
import Recommendations from '../screens/Recommendations';
import RestaurantDetail from '../screens/RestaurantDetail';
import FinalResult from '../screens/FinalResult';

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

import { theme } from '../utils/theme';

const AuthStack = createStackNavigator();
const AppStack = createStackNavigator<RootStackParamList>();

const defaultScreenOptions = {
    headerStyle: {
        backgroundColor: theme.colors.background,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
    },
    headerTintColor: theme.colors.textMain,
    headerTitleStyle: {
        fontWeight: '700' as const,
        fontSize: theme.typography.sizes.lg,
    },
    cardStyle: { backgroundColor: theme.colors.background },
};

function AuthNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ ...defaultScreenOptions, headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="SignUp" component={SignUpScreen} />
        </AuthStack.Navigator>
    );
}

function AppNavigatorContent() {
    return (
        <AppStack.Navigator initialRouteName="Home" screenOptions={defaultScreenOptions}>
            <AppStack.Screen name="Home" component={Home} options={{ headerShown: false }} />
            <AppStack.Screen name="ProfileSetup" component={ProfileSetup} options={{ title: 'Profile Setup' }} />
            <AppStack.Screen name="CreateSession" component={CreateSession} options={{ title: 'Create Session' }} />
            <AppStack.Screen name="JoinSession" component={JoinSession} options={{ title: 'Join Session' }} />
            <AppStack.Screen name="SessionLobby" component={SessionLobby} options={{ title: 'Wait for friends' }} />
            <AppStack.Screen name="Recommendations" component={Recommendations} options={{ title: 'Recommendations' }} />
            <AppStack.Screen
                name="RestaurantDetail"
                component={RestaurantDetail}
                options={{
                    title: 'Details',
                    headerStyle: { backgroundColor: theme.colors.primary, elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 },
                    headerTintColor: '#fff'
                }}
            />
            <AppStack.Screen name="FinalResult" component={FinalResult} options={{ title: 'Final Result', headerLeft: () => null, headerShown: false }} />
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

import { Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PlaceholderHome = () => {
    const navigation = useNavigation<any>();
    const { profile } = useUserProfile(useAuth().user?.uid);

    React.useEffect(() => {
        if (profile === null) {

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