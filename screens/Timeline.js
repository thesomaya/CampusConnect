import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import DataItem from '../components/DataItem';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import colors from '../constants/colors';

const Timeline = props => {
    const userData = useSelector(state => state.auth.userData);


    
    return <PageContainer>

        <PageTitle text="Timeline" />
            {   
                userData.selectedRole == "facultyMember" &&
                <View>
                    <TouchableOpacity onPress={() => props.navigation.navigate()}>
                        <Text style={styles}>New Announcement</Text>
                    </TouchableOpacity>
                </View>
            }

        </PageContainer>
};

const styles = StyleSheet.create({
    
})

export default Timeline;