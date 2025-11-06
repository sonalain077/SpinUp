package com.parkandsee.backend.dto;

import com.parkandsee.backend.entity.PaymentMethod;
import com.parkandsee.backend.entity.ReservationStatus;
import java.time.Instant;
import java.util.UUID;

/**
 * DTO de réponse après création d'une réservation.
 */
public class CreateReservationResponse {

    private UUID reservationId;
    private String plate;
    private String vehicleType;
    private String parkingName;
    private Instant startAt;
    private Instant endAt;
    private Integer durationMinutes;
    private Integer priceCents;
    private PaymentMethod paymentMethod;
    private ReservationStatus status;
    private Instant createdAt;

    // Constructors
    public CreateReservationResponse() {}

    public CreateReservationResponse(UUID reservationId, String plate, String vehicleType,
                                    String parkingName, Instant startAt, Instant endAt,
                                    Integer durationMinutes, Integer priceCents,
                                    PaymentMethod paymentMethod, ReservationStatus status,
                                    Instant createdAt) {
        this.reservationId = reservationId;
        this.plate = plate;
        this.vehicleType = vehicleType;
        this.parkingName = parkingName;
        this.startAt = startAt;
        this.endAt = endAt;
        this.durationMinutes = durationMinutes;
        this.priceCents = priceCents;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public UUID getReservationId() {
        return reservationId;
    }

    public void setReservationId(UUID reservationId) {
        this.reservationId = reservationId;
    }

    public String getPlate() {
        return plate;
    }

    public void setPlate(String plate) {
        this.plate = plate;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getParkingName() {
        return parkingName;
    }

    public void setParkingName(String parkingName) {
        this.parkingName = parkingName;
    }

    public Instant getStartAt() {
        return startAt;
    }

    public void setStartAt(Instant startAt) {
        this.startAt = startAt;
    }

    public Instant getEndAt() {
        return endAt;
    }

    public void setEndAt(Instant endAt) {
        this.endAt = endAt;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Integer getPriceCents() {
        return priceCents;
    }

    public void setPriceCents(Integer priceCents) {
        this.priceCents = priceCents;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
