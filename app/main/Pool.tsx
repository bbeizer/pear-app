import React from 'react';
import { View, Text } from 'react-native';

const Pool = () => {
    console.log('✅ Rendering Pool');
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Pool Screen</Text>
        </View>
    );
};

Pool.displayName = 'PoolScreen';
export default Pool;
