# Éléments à ajouter au backend Spring Boot

## 1. Système d'authentification

### Contrôleur d'authentification
```java
@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        // Implémentation de l'authentification
        // Retourne un JWT token ou session
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // Implémentation de la déconnexion
    }
    
    @GetMapping("/verify")
    public ResponseEntity<UserInfo> verifyToken() {
        // Vérification du token/session
    }
}
```

### DTOs d'authentification
```java
public class LoginRequest {
    private String username;
    private String password;
    // getters/setters
}

public class LoginResponse {
    private String token;
    private String username;
    private Date expiresAt;
    // getters/setters
}

public class UserInfo {
    private String username;
    private List<String> roles;
    // getters/setters
}
```

### Entité User
```java
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    @Column(unique = true)
    private String username;
    
    private String password; // hashé
    
    private boolean active;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    // getters/setters
}
```

## 2. Améliorations des contrôleurs existants

### Ajout de la sécurité aux contrôleurs
- Ajouter `@PreAuthorize` ou `@Secured` aux méthodes
- Middleware d'authentification JWT

### Gestion des erreurs standardisée
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ChangeSetPersister.NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ChangeSetPersister.NotFoundException ex) {
        return ResponseEntity.status(404).body(new ErrorResponse("Resource not found"));
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(400).body(new ErrorResponse(ex.getMessage()));
    }
}

public class ErrorResponse {
    private String message;
    private String timestamp;
    // constructeurs, getters/setters
}
```

## 3. Améliorations du modèle de données

### Ajout d'audit aux entités principales
```java
@MappedSuperclass
public abstract class AuditableEntity {
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private String createdBy;
    private String lastModifiedBy;
    
    // getters/setters
}
```

### Mise à jour des entités existantes
- Faire hériter `Equipement`, `Site`, `Stock` de `AuditableEntity`
- Ajouter des validations JPA (`@NotNull`, `@Size`, etc.)

## 4. Services manquants

### Service d'authentification
```java
@Service
public class AuthService {
    
    public LoginResponse authenticate(String username, String password) {
        // Logique d'authentification
    }
    
    public String generateToken(User user) {
        // Génération de JWT
    }
    
    public boolean validateToken(String token) {
        // Validation du token
    }
}
```

### Service de journalisation
```java
@Service
public class AuditService {
    
    public void logAction(String action, String entityType, int entityId, String username) {
        // Enregistrement des actions dans une table d'audit
    }
}

@Entity
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String action; // CREATE, UPDATE, DELETE
    private String entityType; // EQUIPEMENT, SITE, etc.
    private int entityId;
    private String username;
    
    @CreationTimestamp
    private LocalDateTime timestamp;
    
    // getters/setters
}
```

## 5. Configuration de sécurité

### Configuration Spring Security
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
            .build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000")); // Frontend
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

## 6. Améliorations des DTOs existants

### Validation des DTOs
```java
public class RequetCreateSite {
    @Valid
    @NotNull
    private Site site;
    
    @NotEmpty
    private List<Integer> equipementIdList;
    
    @NotNull
    private Date dateInstall;
    
    private Map<Integer, Date> dateMap;
    
    // getters/setters
}
```

### DTOs de réponse standardisés
```java
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    
    // constructeurs, getters/setters
}
```

## 7. Endpoints manquants

### Endpoint d'authentification
```java
@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Votre logique d'authentification ici
            // Vérifier username/password dans votre base de données
            
            if (isValidUser(loginRequest.getUsername(), loginRequest.getPassword())) {
                LoginResponse response = new LoginResponse();
                response.setUsername(loginRequest.getUsername());
                response.setToken(generateToken(loginRequest.getUsername()));
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401)
                    .body(Map.of("error", "Identifiants incorrects"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Erreur serveur"));
        }
    }
    
    // Classe pour la requête
    public static class LoginRequest {
        private String username;
        private String password;
        // getters/setters
    }
    
    // Classe pour la réponse
    public static class LoginResponse {
        private String username;
        private String token;
        // getters/setters
    }
}
```

### Endpoint de santé (Health Check)
```java
@RestController
public class HealthController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("timestamp", LocalDateTime.now().toString());
        status.put("application", "CAMGAZ-TECH GMAO");
        return ResponseEntity.ok(status);
    }
}
```

### Contrôleur de recherche
```java
@RestController
@RequestMapping("/search")
public class SearchController {
    
    @GetMapping("/equipements")
    public List<Equipement> searchEquipements(@RequestParam String query) {
        // Recherche dans les équipements
    }
    
    @GetMapping("/sites")
    public List<Site> searchSites(@RequestParam String query) {
        // Recherche dans les sites
    }
}
```

### Contrôleur de Dashboard et rapports
```java
@RestController
@RequestMapping("/dashboard")
public class DashboardController {
    
    @GetMapping("/stats")
    public DashboardStats getDashboardStats() {
        // Statistiques générales du dashboard
    }
    
    @GetMapping("/kpis")
    public List<KPI> getKPIs() {
        // Indicateurs clés de performance
    }
    
    @GetMapping("/stock-alerts")
    public List<Stock> getStockAlerts() {
        // Stocks sous seuil critique
    }
    
    @GetMapping("/maintenance-summary")
    public MaintenanceSummary getMaintenanceSummary(@RequestParam String period) {
        // Résumé des maintenances
    }
    
    @GetMapping("/equipment-stats")
    public List<EquipementTypeStats> getEquipmentStatsByType() {
        // Statistiques d'équipements par type
    }
}
```

### DTOs pour le Dashboard
```java
public class DashboardStats {
    private int totalEquipements;
    private int totalSites;
    private int maintenancesPlanifiees;
    private int maintenancesEnRetard;
    private int alertesStock;
    private List<EquipementTypeStats> equipementsParType;
    private List<MaintenanceStats> maintenancesParMois;
    private List<StockCritique> stocksCritiques;
    private List<ProchaineMaintenanceInfo> prochainesmaintenances;
    // getters/setters
}

public class EquipementTypeStats {
    private TypeEquipement type;
    private int count;
    private int pourcentage;
    // getters/setters
}

public class MaintenanceStats {
    private String mois;
    private int planifiees;
    private int realisees;
    private int annulees;
    // getters/setters
}

public class StockCritique {
    private int id_stock;
    private Piece piece;
    private int quantite;
    private int seuil_critique;
    private int pourcentageRestant;
    // getters/setters
}

public class ProchaineMaintenanceInfo {
    private int id_occurenceMainteance;
    private Equipement equipement;
    private LocalDate datePrevue;
    private int joursRestants;
    private String priorite; // HAUTE, MOYENNE, BASSE
    // getters/setters
}

public class KPI {
    private String label;
    private int value;
    private String unit;
    private Integer variation;
    private String status; // success, warning, danger, info
    // getters/setters
}
```

## 8. Configuration des propriétés

### application.yml
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/camgaz_tech
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:password}
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    
  security:
    jwt:
      secret: ${JWT_SECRET:your-secret-key}
      expiration: 86400000 # 24 heures

server:
  port: 8421
  
cors:
  allowed-origins: http://localhost:3000
```

## 9. Tests unitaires recommandés

### Tests pour les contrôleurs
```java
@WebMvcTest(EquipementController.class)
public class EquipementControllerTest {
    
    @MockBean
    private GestionEquipementsImpl service;
    
    @Test
    public void testCreateEquipement() throws Exception {
        // Test de création d'équipement
    }
}
```

### Tests pour les services
```java
@ExtendWith(MockitoExtension.class)
public class GestionEquipementsImplTest {
    
    @Mock
    private EquipementRepository equipementRepository;
    
    @InjectMocks
    private GestionEquipementsImpl service;
    
    @Test
    public void testCreateEquipement() {
        // Test de la logique métier
    }
}
```

## 10. Documentation API

### Configuration Swagger/OpenAPI
```java
@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("CAMGAZ-TECH GMAO API")
                .version("1.0")
                .description("API de gestion de maintenance"))
            .addSecurityItem(new SecurityRequirement().addList("JWT"))
            .components(new Components()
                .addSecuritySchemes("JWT", new SecurityScheme()
                    .name("JWT")
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")));
    }
}
```

Ces ajouts permettront une meilleure sécurité, une gestion d'erreurs appropriée, et une API plus robuste pour l'application frontend.