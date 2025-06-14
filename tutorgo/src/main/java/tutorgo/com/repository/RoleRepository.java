package tutorgo.com.repository;

import tutorgo.com.enums.RoleName;
import tutorgo.com.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByNombre(RoleName nombre);
}
