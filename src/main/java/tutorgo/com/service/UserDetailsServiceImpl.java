// src/main/java/tutorgo/com/security/UserDetailsServiceImpl.java
package tutorgo.com.security;

import tutorgo.com.model.User;
import tutorgo.com.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Usuario no encontrado con el correo electrónico: " + email));

        Set<GrantedAuthority> authorities = new HashSet<>();
        if (user.getRole() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().getNombre().name()));
        } else {
            // Manejar caso de rol nulo si es posible, o lanzar excepción
            authorities.add(new SimpleGrantedAuthority("ROLE_ANONYMOUS"));
        }

        // ***** CAMBIO AQUÍ: Devolver CustomUserDetails *****
        return new CustomUserDetails(user, authorities);
    }
}