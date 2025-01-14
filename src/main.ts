import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin:"*"
  })

  const config = new DocumentBuilder()
    .setTitle('TEKNIK INFORMATIKA')
    .setDescription('A.Fachri - 105841106522')
    .setVersion('0.1')
    .addTag('INFORMATIKA')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app,config);

  SwaggerModule.setup('api-docs', app,documentFactory)

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
