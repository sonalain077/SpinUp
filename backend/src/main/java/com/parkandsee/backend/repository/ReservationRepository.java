package com.parkandsee.backend.repository;

import com.parkandsee.backend.entity.ReservationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<ReservationEntity, String> {
}
