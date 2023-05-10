import { JWTAuthGuard } from '@app/common/guards';
import { StripeModule } from '@app/common/modules/stripe/stripe.module';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Global()
@Module({
  imports: [
    StripeModule.forRoot(process.env.STRIPE_API_KEY, {
      apiVersion: '2020-08-27',
    }),
    PassportModule.register({ session: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '30d',
        },
      }),
      inject: [ConfigService],
    }),
  ],

  providers: [ConfigModule, ConfigService, JWTAuthGuard],
  exports: [
    JwtModule,
    ConfigModule,
    ConfigService,
    JWTAuthGuard,
    ConfigService,
  ],
})
export class CommonModule {}
