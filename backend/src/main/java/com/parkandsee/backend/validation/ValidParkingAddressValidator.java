package com.parkandsee.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.Set;

/**
 * Validateur pour l'annotation @ValidParkingAddress
 * Vérifie que l'adresse correspond à l'un des 5 parkings actifs
 */
public class ValidParkingAddressValidator implements ConstraintValidator<ValidParkingAddress, String> {

    /**
     * Liste des 5 parkings valides dans le système
     */
    private static final Set<String> VALID_PARKINGS = Set.of(
        "Parking Centre Ville",
        "Parking Gare",
        "Parking République",
        "Parking Liberté",
        "Parking Mairie"
    );

    @Override
    public void initialize(ValidParkingAddress constraintAnnotation) {
        // Aucune initialisation nécessaire
    }

    @Override
    public boolean isValid(String address, ConstraintValidatorContext context) {
        // Null est géré par @NotBlank
        if (address == null) {
            return true;
        }

        // Vérifier si le parking est dans la liste valide
        boolean valid = VALID_PARKINGS.contains(address);

        if (!valid) {
            // Message personnalisé avec la liste des parkings disponibles
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Parking '" + address + "' non reconnu. Parkings disponibles: " + 
                String.join(", ", VALID_PARKINGS)
            ).addConstraintViolation();
        }

        return valid;
    }

    /**
     * Retourne la liste des parkings valides (utile pour tests ou API)
     */
    public static Set<String> getValidParkings() {
        return VALID_PARKINGS;
    }
}
