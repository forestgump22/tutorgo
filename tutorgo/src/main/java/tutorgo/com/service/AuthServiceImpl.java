package tutorgo.com.service;

import tutorgo.com.dto.request.LoginRequest;
import tutorgo.com.dto.response.JwtAuthenticationResponse;
import tutorgo.com.dto.response.UserResponse;
import tutorgo.com.exception.ResourceNotFoundException; // Para HU2 Escenario 3
import tutorgo.com.mapper.UserMapper;
import tutorgo.com.model.User;
import tutorgo.com.repository.UserRepository;
import tutorgo.com.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException; // Para HU2 Escenario 2
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public JwtAuthenticationResponse loginUser(LoginRequest loginRequest) {
        // HU2 Escenario 3: Cuenta no encontrada
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Correo no registrado. Regístrese."));

        Authentication authentication;
        try {
            // HU2 Escenario 2: Error de autenticación (credenciales inválidas)
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Credenciales inválidas. Pruebe de nuevo.");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateToken(authentication);
        UserResponse userDto = userMapper.userToUserResponse(user);

        return new JwtAuthenticationResponse(jwt, userDto);
    }
}