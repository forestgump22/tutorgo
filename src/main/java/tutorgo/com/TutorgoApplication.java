package tutorgo.com;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
@EnableScheduling
public class TutorgoApplication {

    public static void main(String[] args) {
        SpringApplication.run(TutorgoApplication.class, args);
    }

}
