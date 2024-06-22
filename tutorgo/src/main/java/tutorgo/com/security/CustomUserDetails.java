// src/main/java/tutorgo/com/security/CustomUserDetails.java (NUEVO ARCHIVO o modifica si ya tienes uno)
package tutorgo.com.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import tutorgo.com.model.User; // Importa tu entidad User

import java.util.Collection;

public class CustomUserDetails implements UserDetails {

    private final User user; // Almacena tu entidad User completa
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(User user, Collection<? extends GrantedAuthority> authorities) {
        this.user = user;
        this.authorities = authorities;
    }

    // Métodos para acceder a la información extra
    public Long getId() {
        return user.getId();
    }

    public String getNombreCompleto() { // O como se llame el método en tu entidad User
        return user.getNombre();
    }

    // Métodos de la interfaz UserDetails
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPassword(); // El hash de la contraseña
    }

    @Override
    public String getUsername() {
        return user.getEmail(); // Usamos email como username
    }

    // Implementa los demás métodos de UserDetails (isAccountNonExpired, etc.)
    // Puedes devolver true para todos si no manejas esas lógicas.
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true; // O según un campo 'enabled' en tu entidad User
    }
}