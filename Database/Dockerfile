# Build runtime image.
FROM mongo:4.4

EXPOSE 27017

# Create the home directory for the new app user.
RUN mkdir /scripts
COPY scripts/*.js /scripts/
