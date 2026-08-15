package com.bdspro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BdsProApplication {

    public static void main(String[] args) {
        SpringApplication.run(BdsProApplication.class, args);
        System.out.println("\n========================================================");
        System.out.println("🚀 [BDS Pro Backend]: Spring Boot Server đã khởi động thành công!");
        System.out.println("📡 [API Base URL]: http://localhost:8080/api/v1");
        System.out.println("📖 [Swagger API Docs]: http://localhost:8080/swagger-ui.html");
        System.out.println("========================================================\n");
    }
}
