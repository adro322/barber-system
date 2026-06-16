package integrador.backend.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    private static final long MAX_WINDOW_MS = 60 * 60 * 1000L; // 1 hora (ventana máxima usada en el sistema)

    private final ConcurrentHashMap<String, Deque<Long>> buckets = new ConcurrentHashMap<>();

    public boolean tryConsume(String key, int maxOps, long windowMs) {
        long now = System.currentTimeMillis();
        Deque<Long> timestamps = buckets.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (timestamps) {
            while (!timestamps.isEmpty() && now - timestamps.peekFirst() > windowMs) {
                timestamps.pollFirst();
            }
            if (timestamps.size() >= maxOps) return false;
            timestamps.addLast(now);
            return true;
        }
    }

    // Cada hora elimina claves cuyo bucket lleva más de 1h sin actividad
    @Scheduled(fixedDelay = 60 * 60 * 1000L)
    public void limpiarBucketsInactivos() {
        long ahora = System.currentTimeMillis();
        buckets.entrySet().removeIf(entry -> {
            Deque<Long> ts = entry.getValue();
            synchronized (ts) {
                return ts.isEmpty() || ahora - ts.peekLast() > MAX_WINDOW_MS;
            }
        });
    }
}
