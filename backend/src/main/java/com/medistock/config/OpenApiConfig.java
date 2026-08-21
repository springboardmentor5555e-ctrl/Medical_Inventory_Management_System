package com.medistock.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI medistockOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("MediStock API")
                        .version("1.0.0")
                        .description("Medical Inventory Management Platform APIs"));
    }
}
