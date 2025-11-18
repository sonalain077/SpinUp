package com.parkandsee.backend.validation;

import com.parkandsee.backend.entity.ParkingEntity;
import com.parkandsee.backend.repository.ParkingRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Validateur pour l'annotation @ValidParkingAddress
 * Vérifie que l'adresse correspond à un parking existant en base de données
 */
@Component
public class ValidParkingAddressValidator implements ConstraintValidator<ValidParkingAddress, String> {

    @Autowired
    private ParkingRepository parkingRepository;

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

        // Charger les parkings depuis la BDD
        List<ParkingEntity> parkings = parkingRepository.findAll();
        Set<String> validParkingNames = parkings.stream()
            .map(ParkingEntity::getName)
            .collect(Collectors.toSet());

        // Vérifier si le parking est dans la liste valide
        boolean valid = validParkingNames.contains(address);

        if (!valid) {
            // Message personnalisé avec la liste des parkings disponibles
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Parking '" + address + "' non reconnu. Parkings disponibles: " + 
                String.join(", ", validParkingNames)
            ).addConstraintViolation();
        }

        return valid;
    }
}
