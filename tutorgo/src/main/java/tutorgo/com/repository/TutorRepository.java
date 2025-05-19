package tutorgo.com.repository;

import tutorgo.com.model.Tutor;
import tutorgo.com.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TutorRepository extends JpaRepository<Tutor, Long> {
    Optional<Tutor> findByUser(User user);
    Optional<Tutor> findByUserId(Long userId);
}