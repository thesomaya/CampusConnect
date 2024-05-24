import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CustomDropdown from './CustomDropDown.js';
import SignUpFaculty from './SignUpFaculty';
import SignUpStudent from './SignUpStudent';

const SignUpForm = () => {
  const [selectedRole, setSelectedRole] = useState('student');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select your role</Text>
      <CustomDropdown
        items={[
          { label: 'Student', value: 'student' },
          { label: 'Faculty Member', value: 'facultyMember' },
        ]}
        selectedValue={selectedRole}
        onValueChange={setSelectedRole}
      />
      {selectedRole === 'student' ? <SignUpStudent /> : <SignUpFaculty />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    marginBottom: 10,
    fontFamily: 'bold',
    fontSize: 14,
  },
});

export default SignUpForm;
