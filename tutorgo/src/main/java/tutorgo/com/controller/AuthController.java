package tutorgo.com.controller;

import tutorgo.com.dto.request.LoginRequest;
import tutorgo.com.dto.request.UserRegistrationRequest;
import tutorgo.com.dto.response.ApiResponse;
import tutorgo.com.dto.response.JwtAuthenticationResponse;
import tutorgo.com.dto.response.UserResponse;
import tutorgo.com.service.AuthService;
import tutorgo.com.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(@Valid @RequestBody UserRegistrationRequest registrationRequest) {
        UserResponse userResponse = userService.registerUser(registrationRequest);
        ApiResponse apiResponse = new ApiResponse(true, "¡Registro exitoso! Ahora puedes iniciar sesión.", userResponse);
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthenticationResponse> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtAuthenticationResponse jwtResponse = authService.loginUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }
}