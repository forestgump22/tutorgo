package tutorgo.com.service;

import tutorgo.com.dto.request.LoginRequest;
import tutorgo.com.dto.response.JwtAuthenticationResponse;

public interface AuthService {
    JwtAuthenticationResponse loginUser(LoginRequest loginRequest);
}