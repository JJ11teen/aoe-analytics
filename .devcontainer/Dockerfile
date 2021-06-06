# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.174.0/containers/typescript-node/.devcontainer/base.Dockerfile

# [Choice] Node.js version: 14, 12, 10
ARG VARIANT="14-buster"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

RUN curl -sLO "https://github.com/sass/dart-sass/releases/download/1.32.12/dart-sass-1.32.12-linux-x64.tar.gz" \
    && tar -xvzf ./dart-sass-1.32.12-linux-x64.tar.gz \
    && chmod +x ./dart-sass/sass \
    && sudo mv ./dart-sass/sass /usr/local/bin/sass \
    && rm ./dart-sass-1.32.12-linux-x64.tar.gz \
    && rm -r ./dart-sass

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node packages
# RUN su node -c "npm install -g <your-package-list -here>"
