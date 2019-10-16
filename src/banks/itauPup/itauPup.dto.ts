import { IsString } from 'class-validator';

class CreateItauPupDto {
    @IsString()
    public branch: string;

    @IsString()
    public account: string;

    @IsString()
    public password: string;
}

export default CreateItauPupDto;