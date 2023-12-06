import { validate } from 'validate.js';

export const validateString = (id, value) => {
    const constraints = {
        presence: { allowEmpty : false },
    };

    if (value !== "") {
        constraints.format = {
            pattern: "[a-zA-ZğüşıöçĞÜŞİÖÇ]+$",
            flags: "i",
            message: "value can only contain letters."
        }
    }
    const validationResult = validate({ [id]: value}, {[id]: constraints});
    
    return validationResult && validationResult[id];
}

export const validateLength = (id, value, minLength, maxLength, allowEmpty) => {
    const constraints = {
        presence: { allowEmpty },
    };

    if (!allowEmpty || value !== "") {
        constraints.length = {
        }

        if (minLength != null) {
            constraints.length.minimum = minLength;
        }

        if (maxLength != null) {
            constraints.length.maximum = maxLength;
        }
    }
    const validationResult = validate({ [id]: value}, {[id]: constraints});
    
    return validationResult && validationResult[id];
}

export const validateStudentNumber = (id, value, selectedRole) => {
    const constraints = {
      presence: {
        allowEmpty: selectedRole !== "student",
      },
    };
  
    if (value !== "") {
      constraints.numericality = {
        onlyInteger: true,
        greaterThan: 200000000,
        lessThanOrEqualTo: 300000000,
        message: "is not valid.",
      };
    }
  
    const validationResult = validate({ [id]: value }, { [id]: constraints });
  
    return validationResult && validationResult[id];
  };
  

export const validateEmail = (id, value, selectedRole) => {
    
    const constraints = {
        presence: { allowEmpty : false },
    };

    let validSchoolDomain;
  
    if (selectedRole && selectedRole === 'student') {
      validSchoolDomain = 'ogr.altinbas.edu.tr';
    } else if (selectedRole && selectedRole === 'facultyMember') {
      validSchoolDomain = 'altinbas.edu.tr';
    } else {
        validSchoolDomain = 'ogr.altinbas.edu.tr' || 'altinbas.edu.tr';
    }
  
    const isValidEmail = /^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    const isSchoolDomain = value.endsWith(`@${validSchoolDomain}`);
  
    if (!isValidEmail) {
      return ['Please enter a valid email address.'] ;
    }
  
    if (!isSchoolDomain) {
      return  [`Please enter an email address from ${validSchoolDomain}`];
    }
  
    const validationResult = validate({ [id]: value}, {[id]: constraints});
    
    return validationResult && validationResult[id];
  };
  
export const validatePassword = (id, value) => {
    const constraints = {
        presence: { allowEmpty : false },
    };

    if (value !== "") {
        
            constraints.length =  {
                minimum: 6,
                maximum: 24,
                message: "must be between 6 and 24 characters",

        }
    };
    
    const validationResult = validate({ [id]: value}, {[id]: constraints});
    
    return validationResult && validationResult[id];
}