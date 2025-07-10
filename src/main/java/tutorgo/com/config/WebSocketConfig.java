package tutorgo.com.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Habilita un broker de mensajes en memoria para enviar mensajes a clientes
        // en destinos que comiencen con "/topic".
        config.enableSimpleBroker("/topic");
        // Define el prefijo para mensajes que se dirigen a métodos anotados con @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Registra el endpoint "/ws" para que los clientes se conecten al WebSocket
        // withSockJS() proporciona alternativas para navegadores que no soportan WebSocket
        registry.addEndpoint("/ws").setAllowedOrigins("*").withSockJS();
    }
}
