package com.gmao.CAMGAZ_TECH.config;

import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Configuration Jackson pour assurer une sérialisation cohérente des dates
 * entre le backend Java et le frontend JavaScript
 */
@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        // Créer le module JavaTime personnalisé
        JavaTimeModule javaTimeModule = new JavaTimeModule();

        // Configurer le format de sérialisation pour LocalDate
        javaTimeModule.addSerializer(LocalDate.class,
                new LocalDateSerializer(DateTimeFormatter.ofPattern("yyyy-MM-dd")));

        return JsonMapper.builder()
                .addModule(javaTimeModule)
                // Désactiver la sérialisation des dates comme timestamps
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                // Configurer d'autres options si nécessaire
                .build();
    }
}