FROM node:20-alpine AS builder


LABEL maintainer="Mohamed Ashraf | Ahmed Kamel | Omar Hatem | Anas Mahmoud"
LABEL description="Event Scheduling System - Angular Frontend Builder"
LABEL version="1.0.0"


WORKDIR /app


COPY package*.json ./


RUN npm ci --legacy-peer-deps


COPY . .


RUN npm run build -- --configuration=production


FROM nginx:alpine


LABEL maintainer="Mohamed Ashraf | Ahmed Kamel | Omar Hatem | Anas Mahmoud"
LABEL description="Event Scheduling System - Angular Frontend"
LABEL version="1.0.0"


RUN apk add --no-cache curl


RUN rm -rf /usr/share/nginx/html/*


COPY --from=builder /app/dist/event-scheduling-system/browser /usr/share/nginx/html


COPY nginx.conf /etc/nginx/conf.d/default.conf


RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid


EXPOSE 80


HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:80 || exit 1


CMD ["nginx", "-g", "daemon off;"]