import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import SignUpFaculty from './SignUpFaculty';
import SignUpStudent from './SignUpStudent';

const SignUp = () => {
  const [selectedRole, setSelectedRole] = useState("student");

  const PickerChangedHandler = itemValue => {
    setSelectedRole(itemValue);
  }

  return (
    <View>
      <Text style={{ marginTop: -50, fontFamily: "bold", fontSize: 14 }}>Select your role</Text>
      <Picker
        itemStyle={{ fontFamily: "regular", fontSize: 14, marginTop: -60, marginBottom: -40 }}
        selectedValue={selectedRole}
        onValueChange={(itemValue) => PickerChangedHandler(itemValue)}>
        <Picker.Item label="Student" value="student" />
        <Picker.Item label="Faculty Member" value="facultyMember" />
      </Picker>

      {selectedRole === "student" ? <SignUpStudent /> : <SignUpFaculty />}
    </View>
  )
};

export default SignUp;
