package tutorgo.com.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import tutorgo.com.dto.request.LoginRequest;
import tutorgo.com.dto.response.JwtAuthenticationResponse;
import tutorgo.com.dto.response.UserResponse;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.UserMapper;
import tutorgo.com.model.Role;
import tutorgo.com.model.User;
import tutorgo.com.repository.UserRepository;
import tutorgo.com.security.JwtTokenProvider;
import tutorgo.com.enums.RoleName;


import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthServiceImpl authService;

    private LoginRequest loginRequest;
    private User user;
    private UserResponse userResponse;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        Role role = new Role(1, RoleName.ESTUDIANTE);
        user = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("encodedPassword") // Simula la contraseña hasheada
                .role(role)
                .nombre("Test User")
                .build();

        userResponse = new UserResponse(); // Simula la respuesta del mapper
        userResponse.setId(1L);
        userResponse.setEmail("test@example.com");
        userResponse.setRol(RoleName.ESTUDIANTE);

        authentication = mock(Authentication.class); // Mock de la interfaz Authentication
    }

    // HU2 Escenario 1: Inicio de sesión exitoso
//    @Test
//    void loginUser_Success() {
//        authentication = mock(Authentication.class);
//        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
//        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
//        when(jwtTokenProvider.generateToken(authentication)).thenReturn("mocked.jwt.token");
//        when(userMapper.userToUserResponse(user)).thenReturn(userResponse);
//        // Simular getName() en el mock de Authentication si JwtTokenProvider o algo más lo usa indirectamente.
//        // En nuestro JwtTokenProvider, usamos authentication.getName()
//        when(authentication.getName()).thenReturn(user.getEmail());
//
//
//        JwtAuthenticationResponse result = authService.loginUser(loginRequest);
//
//        assertNotNull(result);
//        assertEquals("mocked.jwt.token", result.getAccessToken());
//        assertEquals(userResponse, result.getUser());
//    }
    @Test
    void loginUser_Success() {
        // Este 'user' es tu mockUser de setUp
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));

        // Crear una instancia concreta de Authentication para que authenticationManager la devuelva
        Authentication successfulAuthentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(), // Principal
                null,            // Credentials (no relevantes para la generación del token aquí)
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().getNombre().name())) // Authorities
        );
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(successfulAuthentication);

        // jwtTokenProvider recibirá 'successfulAuthentication'
        when(jwtTokenProvider.generateToken(successfulAuthentication)).thenReturn("mocked.jwt.token");

        // userMapper recibirá el 'user' original
        when(userMapper.userToUserResponse(user)).thenReturn(userResponse);

        // Ya no necesitas el mock 'authentication = mock(Authentication.class);' para este test específico,
        // ni los stubbings 'when(authentication.getName())...' o 'when(authentication.getAuthorities())...'

        JwtAuthenticationResponse result = authService.loginUser(loginRequest);

        assertNotNull(result);
        assertEquals("mocked.jwt.token", result.getAccessToken());
        assertEquals(userResponse, result.getUser());

        // Puedes verificar las interacciones con los mocks si lo deseas
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtTokenProvider).generateToken(successfulAuthentication);
        verify(userMapper).userToUserResponse(user);
    }
    // HU2 Escenario 2: Error de autenticación (credenciales inválidas)
    @Test
    void loginUser_InvalidCredentials_ThrowsBadCredentialsException() {
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Credenciales inválidas"));

        BadCredentialsException exception = assertThrows(BadCredentialsException.class, () -> {
            authService.loginUser(loginRequest);
        });

        assertEquals("Credenciales inválidas. Pruebe de nuevo.", exception.getMessage());
    }

    // HU2 Escenario 3: Cuenta no encontrada
    @Test
    void loginUser_UserNotFound_ThrowsResourceNotFoundException() {
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            authService.loginUser(loginRequest);
        });

        assertEquals("Correo no registrado. Regístrese.", exception.getMessage());
    }
}