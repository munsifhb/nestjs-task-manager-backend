import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform : true,
      whitelist : true,
      forbidNonWhitelisted : true,
    }),
    
  )
  
app.enableCors({
  origin:
    process.env.FRONTEND_URL ||
    'https://task-manager-frontend-gilt-omega.vercel.app',
  credentials: true,
});

  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
