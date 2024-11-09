(function(Scratch) {
    'use strict';

    // Register TurboAuth extension
    class TurboAuth {
        getInfo() {
            return {
                id: 'turboauth',
                name: 'TurboAuth',
                blocks: [
                    {
                        opcode: 'registerUser',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'register user [USERNAME] with email [EMAIL] and password [PASSWORD]',
                        arguments: {
                            USERNAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'username'
                            },
                            EMAIL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'email@example.com'
                            },
                            PASSWORD: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'password'
                            }
                        }
                    },
                    {
                        opcode: 'loginUser',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'login user with email [EMAIL] and password [PASSWORD]',
                        arguments: {
                            EMAIL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'email@example.com'
                            },
                            PASSWORD: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'password'
                            }
                        }
                    },
                    {
                        opcode: 'verifyEmail',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'verify email with code [VERIFICATION_CODE]',
                        arguments: {
                            VERIFICATION_CODE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'verification_code'
                            }
                        }
                    },
                    {
                        opcode: 'recoverPassword',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'recover password for email [EMAIL]',
                        arguments: {
                            EMAIL: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'email@example.com'
                            }
                        }
                    }
                ]
            };
        }

        registerUser(args) {
            const username = args.USERNAME;
            const email = args.EMAIL;
            const password = args.PASSWORD;

            fetch('http://localhost:6555/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            })
            .then(response => response.text())
            .then(data => {
                alert(data);
                window.location.href = 'email_verification.html';  // Redirect to email verification
            })
            .catch(error => {
                alert('Registration failed: ' + error);
            });
        }

        loginUser(args) {
            const email = args.EMAIL;
            const password = args.PASSWORD;

            fetch('http://localhost:6555/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Login successful!');
                    window.location.href = 'profile.html';  // Redirect to profile page
                } else {
                    alert('Login failed: ' + data.message);
                }
            })
            .catch(error => {
                alert('Login failed: ' + error);
            });
        }

        verifyEmail(args) {
            const code = args.VERIFICATION_CODE;

            fetch('http://localhost:6555/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code })
            })
            .then(response => response.text())
            .then(data => {
                alert(data);
                window.location.href = 'login.html';  // Redirect to login page
            })
            .catch(error => {
                alert('Verification failed: ' + error);
            });
        }

        recoverPassword(args) {
            const email = args.EMAIL;

            fetch('http://localhost:6555/recover', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            })
            .then(response => response.text())
            .then(data => {
                alert(data);
                // Optionally, redirect to a confirmation page or provide further instructions
            })
            .catch(error => {
                alert('Recovery failed: ' + error);
            });
        }
    }

    Scratch.extensions.register(new TurboAuth());
})(Scratch);
