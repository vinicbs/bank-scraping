import { IsString, IsNotEmpty, MinLength } from 'class-validator';

class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    public email: string;

    @IsNotEmpty()
    @IsString()
    public name: string;

    @MinLength(6)
    @IsString()
    public password: string;
}

export default CreateUserDto;