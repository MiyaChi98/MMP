import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ResponseInterceptor } from "./interceptors/response.interceptor";
import { AllExceptionsFilter } from "./filters/all-exceptions.filter";
import { SuccessLogsService } from "./logs/services/success-logs.service";
import { ErrorLogsService } from "./logs/services/error-logs.service";
import { VersioningType } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(
    // <NestExpressApplication>
    AppModule,
  );
  const successLogsService = app.get(SuccessLogsService);
  const errorLogsService = app.get(ErrorLogsService);
  app.useGlobalInterceptors(new ResponseInterceptor(successLogsService));
  app.useGlobalFilters(new AllExceptionsFilter(errorLogsService));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });
  const config = new DocumentBuilder()
    .setTitle("API")
    .setDescription("")
    .addBearerAuth()
    .setVersion("1.0")
    .addTag("")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);
  app.enableCors({
    allowedHeaders: "*",
    origin: "*",
  });
  // app.useStaticAssets(join(__dirname, "..", "uploads"), {
  //   prefix: "/uploads/",
  // });
  // app.useGlobalGuards();
  await app.listen(8000);
}
bootstrap();
