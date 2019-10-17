import { IsString, IsEmpty, Length } from 'class-validator';

class CreateItauPupDto {
    @Length(4, 4)
    @IsString()
    public branch: string;

    @Length(6, 6)
    @IsString()
    public account: string;

    @Length(6, 6)
    @IsString()
    public password: string;
}

export default CreateItauPupDto;