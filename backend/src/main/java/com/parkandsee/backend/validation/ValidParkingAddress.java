package com.parkandsee.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Annotation de validation pour vérifier que l'adresse correspond à un parking valide
 */
@Documented
@Constraint(validatedBy = ValidParkingAddressValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidParkingAddress {
    String message() default "Parking invalide. Veuillez sélectionner un parking existant.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
