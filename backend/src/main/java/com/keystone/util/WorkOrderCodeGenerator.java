package com.keystone.util;

import com.keystone.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

@Component
@RequiredArgsConstructor
public class WorkOrderCodeGenerator {

    private final WorkOrderRepository workOrderRepository;

    @Transactional(readOnly = true)
    public synchronized String generateNextCode() {
        int currentYear = Year.now().getValue();
        long count = workOrderRepository.count();
        long nextSeq = count + 1;

        String code;
        do {
            code = String.format("WO-%d-%06d", currentYear, nextSeq);
            nextSeq++;
        } while (workOrderRepository.findByWorkOrderCode(code).isPresent());

        return code;
    }
}
