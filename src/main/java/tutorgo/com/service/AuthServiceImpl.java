package tutorgo.com.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import tutorgo.com.dto.request.GoogleLoginRequest;
import tutorgo.com.dto.request.LoginRequest;
import tutorgo.com.dto.request.UserRegistrationRequest;
import tutorgo.com.dto.response.JwtAuthenticationResponse;
import tutorgo.com.dto.response.UserResponse;
import tutorgo.com.enums.RoleName;
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.UserMapper;
import tutorgo.com.model.User;
import tutorgo.com.repository.UserRepository;
import tutorgo.com.security.CustomUserDetails;
import tutorgo.com.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final UserService userService;
    private final UserMapper userMapper;

    @Value("${google.client.id}")
    private String googleClientId;

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

    @Override
    @Transactional
    public JwtAuthenticationResponse loginWithGoogle(GoogleLoginRequest googleLoginRequest) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(googleLoginRequest.getGoogleToken());
            if (idToken == null) {
                throw new BadRequestException("Token de Google inválido.");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                UserRegistrationRequest registrationRequest = new UserRegistrationRequest();
                registrationRequest.setEmail(email);
                registrationRequest.setNombre(name);
                registrationRequest.setFotoUrl(pictureUrl);
                registrationRequest.setPassword("SocialLogin_RandomPassword_" + System.currentTimeMillis());
                registrationRequest.setRol(RoleName.ESTUDIANTE);
                registrationRequest.setCentroEstudioId(1L);

                UserResponse newUserResponse = userService.registerUser(registrationRequest);
                return userRepository.findById(newUserResponse.getId()).orElseThrow();
            });

            Set<GrantedAuthority> authorities = user.getRole() != null
                    ? Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().getNombre().name()))
                    : Collections.emptySet();

            CustomUserDetails userDetails = new CustomUserDetails(user, authorities);

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String jwt = jwtTokenProvider.generateToken(authentication);
            UserResponse userDto = userMapper.userToUserResponse(user);

            return new JwtAuthenticationResponse(jwt, userDto);

        } catch (GeneralSecurityException | IOException e) {
            throw new RuntimeException("Error al verificar el token de Google", e);
        }
    }
}