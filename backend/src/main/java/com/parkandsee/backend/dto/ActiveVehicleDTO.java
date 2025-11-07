package com.parkandsee.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO pour représenter un véhicule actuellement stationné
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActiveVehicleDTO {
    private String licencePlate;
    private String vehicleType;
    private String parkingName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private Integer remainingMinutes;
    private String status; // ACTIVE ou OVERDUE
    private Double amountPaid;
}
