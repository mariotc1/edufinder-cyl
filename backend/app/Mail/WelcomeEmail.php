<?php
    namespace App\Mail;

    use App\Models\User;
    use Illuminate\Bus\Queueable;
    use Illuminate\Mail\Mailable;
    use Illuminate\Queue\SerializesModels;

    use Illuminate\Contracts\Queue\ShouldQueue;

    // EMAIL DE BIENVENIDA
    // Mailable que se envía al registrar un nuevo usuario
    // Implementa ShouldQueue para envío asíncrono
    class WelcomeEmail extends Mailable implements ShouldQueue {
        use Queueable, SerializesModels;

        public $user;

        public function __construct(User $user) {
            $this->user = $user;
        }

        // CONSTRUCCIÓN DEL MENSAJE
        public function build() {
            return $this->view('emails.welcome')
                ->subject('Bienvenido a EduFinder CYL');
        }
    }
?>