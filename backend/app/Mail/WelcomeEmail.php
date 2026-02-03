<?php
    namespace App\Mail;

    use App\Models\User;
    use Illuminate\Bus\Queueable;
    use Illuminate\Mail\Mailable;
    use Illuminate\Queue\SerializesModels;

    use Illuminate\Contracts\Queue\ShouldQueue;

    class WelcomeEmail extends Mailable implements ShouldQueue {
        use Queueable, SerializesModels;

        public $user;

        public function __construct(User $user) {
            $this->user = $user;
        }

        public function build() {
            return $this->view('emails.welcome')
                ->subject('Bienvenido a EduFinder CYL');
        }
    }
?>