from letsencrypt_cert import LetsEncryptCert


class CertServerCert(LetsEncryptCert):
    def __init__(self):
        super().__init__()

    def create(self, force: bool = False) -> None:
        super().create(force)
