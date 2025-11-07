package com.parkandsee.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO pour représenter l'occupation d'un parking
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParkingOccupancyDTO {
    private String parkingId;
    private String parkingName;
    private String address;
    private Integer totalSpots;
    private Integer occupiedSpots;
    private Integer availableSpots;
    private Double occupancyRate;
    private Integer overdueCount;
}
