package com.cloudstorage.bootstrap;

import com.cloudstorage.model.GlobalRole;
import com.cloudstorage.model.User;
import com.cloudstorage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates a default admin account on first startup so there's always a way in
 * to the /admin area without manual DB editing. Logs the credentials once.
 *
 * CHANGE THIS PASSWORD (or delete the account and create your own admin via
 * the AdminService) before deploying anywhere real.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrap implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@clouddrive.com";
    private static final String ADMIN_PASSWORD = "Admin@123";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail(ADMIN_EMAIL)) {
            return;
        }

        User admin = User.builder()
                .name("Platform Admin")
                .email(ADMIN_EMAIL)
                .password(passwordEncoder.encode(ADMIN_PASSWORD))
                .role(GlobalRole.ADMIN)
                .active(true)
                .build();

        userRepository.save(admin);

        log.info("=================================================================");
        log.info(" Default admin account created:");
        log.info("   email:    {}", ADMIN_EMAIL);
        log.info("   password: {}", ADMIN_PASSWORD);
        log.info(" Change this password after first login.");
        log.info("=================================================================");
    }
}
