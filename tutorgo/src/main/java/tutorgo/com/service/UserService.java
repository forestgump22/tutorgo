package tutorgo.com.service;

import tutorgo.com.dto.request.UpdatePasswordRequest;
import tutorgo.com.dto.request.UpdateUserProfileRequest;
import tutorgo.com.dto.request.UserRegistrationRequest;
import tutorgo.com.dto.response.UserResponse;

public interface UserService {
    UserResponse registerUser(UserRegistrationRequest registrationRequest);
    void updatePassword(String userEmail, UpdatePasswordRequest updatePasswordRequest);

    void deleteUserProfile(String userEmail);
}