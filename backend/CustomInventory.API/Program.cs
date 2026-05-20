using CustomInventory.API.Extensions;
using CustomInventory.Application.Interfaces;
using CustomInventory.Application.Mappings;
using CustomInventory.Application.Services;
using CustomInventory.Domain.Entities;
using CustomInventory.Infrastructure.Data;
using CustomInventory.Infrastructure.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddIdentity();
builder.Services.AddApplicationServices();
builder.Services.AddSwagger();
builder.Services.AddJwtServices(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())    
{
    app.MapOpenApi();
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await app.SeedRolesAsync();

app.Run();